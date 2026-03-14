import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"

const args = process.argv.slice(2)

const sourceRoot = path.resolve(args[0] ?? "../old.tokiame.cn/source/_posts")
const targetRoot = path.resolve(args[1] ?? "./src/content/posts/migrated")

function normalizeDate(value) {
  if (!value) return "1970-01-01"

  const raw = String(value).trim()
  const [datePart] = raw.split(/[T\s]/)

  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return "1970-01-01"

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function normalizeTags(value) {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .flatMap((v) => String(v).split(/[\r\n]+/))
      .map((v) => v.trim())
      .filter(Boolean)
  }
  if (typeof value === "string") {
    return value
      .split(/[\r\n;,，、]/)
      .map((v) => v.trim())
      .filter(Boolean)
  }
  return []
}

function normalizeCategory(value) {
  if (!value) return ""

  const flattenPath = (item) => {
    if (Array.isArray(item)) {
      return item.map((x) => String(x).trim()).filter(Boolean).join("/")
    }
    return String(item).trim()
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const category = flattenPath(item)
      if (category) return category
    }
    return ""
  }

  return String(value).trim()
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value
  if (typeof value === "string") {
    const lowered = value.trim().toLowerCase()
    if (["true", "1", "yes", "on"].includes(lowered)) return true
    if (["false", "0", "no", "off"].includes(lowered)) return false
  }
  if (typeof value === "number") return value !== 0
  return fallback
}

function quoteYamlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`
}

function serializeFrontmatter(data) {
  const lines = ["---"]

  lines.push(`title: ${quoteYamlString(data.title)}`)
  lines.push(`published: ${data.published}`)

  if (data.updated) {
    lines.push(`updated: ${data.updated}`)
  }

  lines.push(`description: ${quoteYamlString(data.description)}`)
  lines.push(`image: ${quoteYamlString(data.image)}`)

  if (data.tags.length > 0) {
    lines.push("tags:")
    for (const tag of data.tags) {
      lines.push(`  - ${quoteYamlString(tag)}`)
    }
  } else {
    lines.push("tags: []")
  }

  lines.push(`category: ${quoteYamlString(data.category)}`)
  lines.push(`draft: ${data.draft ? "true" : "false"}`)
  lines.push(`pinned: ${data.pinned ? "true" : "false"}`)
  lines.push(`lang: ${quoteYamlString(data.lang)}`)
  lines.push(`author: ${quoteYamlString(data.author)}`)

  if (data.password) lines.push(`password: ${quoteYamlString(data.password)}`)
  if (data.passwordHint) lines.push(`passwordHint: ${quoteYamlString(data.passwordHint)}`)
  if (data.sourceLink) lines.push(`sourceLink: ${quoteYamlString(data.sourceLink)}`)
  if (data.licenseName) lines.push(`licenseName: ${quoteYamlString(data.licenseName)}`)
  if (data.licenseUrl) lines.push(`licenseUrl: ${quoteYamlString(data.licenseUrl)}`)

  lines.push("---")
  return lines.join("\n")
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function listMarkdownFiles(root) {
  const result = []

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
        result.push(fullPath)
      }
    }
  }

  await walk(root)
  return result
}

function buildFrontmatter(data, titleFallback) {
  const title = data.title ? String(data.title) : titleFallback
  const published = normalizeDate(data.date ?? data.published ?? data.created)
  const updated = normalizeDate(data.updated)

  return {
    title,
    published,
    updated: updated !== "1970-01-01" ? updated : "",
    description: data.description ? String(data.description) : "",
    image: data.cover ? String(data.cover) : data.image ? String(data.image) : "",
    tags: normalizeTags(data.tags),
    category: normalizeCategory(data.categories ?? data.category),
    draft: normalizeBoolean(data.draft, false),
    pinned: normalizeBoolean(data.top ?? data.pinned ?? data.sticky, false),
    lang: data.lang ? String(data.lang) : "",
    author: data.author ? String(data.author) : "",
    password: data.password ? String(data.password) : "",
    passwordHint: data.passwordHint ? String(data.passwordHint) : "",
    sourceLink: data.sourceLink ? String(data.sourceLink) : "",
    licenseName: data.licenseName ? String(data.licenseName) : "",
    licenseUrl: data.licenseUrl ? String(data.licenseUrl) : "",
  }
}

async function migrate() {
  const files = await listMarkdownFiles(sourceRoot)
  await ensureDir(targetRoot)

  let migrated = 0
  let skipped = 0
  const errors = []

  for (const filePath of files) {
    try {
      const relativePath = path.relative(sourceRoot, filePath)
      const targetPath = path.join(targetRoot, relativePath)
      await ensureDir(path.dirname(targetPath))

      const raw = await fs.readFile(filePath, "utf8")
      const parsed = matter(raw)
      const titleFallback = path.parse(filePath).name
      const frontmatter = buildFrontmatter(parsed.data, titleFallback)

      const output = `${serializeFrontmatter(frontmatter)}\n\n${parsed.content.trimStart()}`
      await fs.writeFile(targetPath, output, "utf8")
      migrated += 1
    } catch (error) {
      skipped += 1
      errors.push({ filePath, message: error instanceof Error ? error.message : String(error) })
    }
  }

  console.log(`Source: ${sourceRoot}`)
  console.log(`Target: ${targetRoot}`)
  console.log(`Migrated: ${migrated}`)
  console.log(`Skipped: ${skipped}`)

  if (errors.length > 0) {
    console.log("Errors:")
    for (const item of errors) {
      console.log(`- ${item.filePath}: ${item.message}`)
    }
    process.exitCode = 1
  }
}

migrate().catch((error) => {
  console.error(error)
  process.exit(1)
})
