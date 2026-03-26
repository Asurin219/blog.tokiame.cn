import type { FriendLink, FriendsPageConfig } from "../types/config";

export const friendsPageConfig: FriendsPageConfig = {
	title: "",
	description: "",
	showCustomContent: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
	randomizeSort: false,
};

export const friendsConfig: FriendLink[] = [
	{
		title: "MYW",
		imgurl: "https://crazywong.com/img/avatar.png",
		desc: "今日事,今日畢",
		siteurl: "https://crazywong.com/",
		tags: ["梦开始的地方"],
		weight: 19,
		enabled: true,
	},
	{
		title: "Hexo",
		imgurl: "https://d33wubrfki0l68.cloudfront.net/6657ba50e702d84afb32fe846bed54fba1a77add/827ae/logo.svg",
		desc: "快速、简洁且高效的博客框架",
		siteurl: "https://hexo.io/zh-cn/",
		tags: ["梦开始的地方"],
		weight: 18,
		enabled: true,
	},
	{
		title: "Butterfly",
		imgurl: "https://fastly.jsdelivr.net/gh/jerryc127/CDN/img/butterfly-github-avatar.png",
		desc: "🦋 A Hexo Theme: Butterfly",
		siteurl: "https://github.com/jerryc127/hexo-theme-butterfly",
		tags: ["梦开始的地方"],
		weight: 17,
		enabled: true,
	},
	{
		title: "小小世界",
		imgurl: "https://echoxxzhang.github.io/images/max.jpg",
		desc: "山不过来，我便过去",
		siteurl: "https://echoxxzhang.github.io/",
		tags: ["通往异世界"],
		weight: 13,
		enabled: true,
	},
	{
		title: "弹霄博科",
		imgurl: "https://static.txisfine.cn/images/avatar.png/pk_img",
		desc: "小谈谈的一亩三分地",
		siteurl: "https://www.txisfine.cn/",
		tags: ["通往异世界"],
		weight: 12,
		enabled: true,
	},
	{
		title: "Akilarの糖果屋",
		imgurl: "https://npm.elemecdn.com/akilar-candyassets/image/siteicon/favicon.png",
		desc: "期待您的光临！",
		siteurl: "https://akilar.top/",
		tags: ["通往异世界"],
		weight: 11,
		enabled: true,
	},
	{
		title: "夏夜流萤",
		imgurl:
			"https://weavatar.com/avatar/d252655d40d6874417a720bad0a6c5f77f8f6a1fd2f882f8f338402dc37e4190?s=640",
		desc: "飞萤之火自无梦的长夜亮起，绽放在终竟的明天。",
		siteurl: "https://blog.cuteleaf.cn",
		tags: ["通往异世界"],
		weight: 9,
		enabled: true,
	},
	{
		title: "百里飞洋の博客",
		imgurl: "https://blog.meta-code.top/img/friends/Barry-Flynn.jpg",
		desc: "星河滚烫，无问西东",
		siteurl: "https://blog.meta-code.top/",
		tags: ["通往异世界"],
		weight: 5,
		enabled: true,
	},
	{
		title: "aJream博客",
		imgurl: "https://ajream.vercel.app/static/imgs/avatar.png",
		desc: "热爱生活，拥抱技术",
		siteurl: "https://ajream.vercel.app",
		tags: ["通往异世界"],
		weight: 4,
		enabled: true,
	},
	{
		title: "Fomalhaut🥝",
		imgurl: "https://www.fomal.cc/assets/head.jpg",
		desc: "Future is now 🍭🍭🍭",
		siteurl: "https://www.fomal.cc/",
		tags: ["通往异世界"],
		weight: 3,
		enabled: true,
	},
	{
		title: "小冰博客",
		imgurl: "https://zfe.space/images/headimage.png",
		desc: "做个有梦想的人！",
		siteurl: "https://zfe.one",
		tags: ["通往异世界"],
		weight: 2,
		enabled: true,
	},
	{
		title: "张洪Heo",
		imgurl: "https://img.zhheo.com/i/2022/08/19/62ff32fa28da1.png",
		desc: "",
		siteurl: "https://blog.zhheo.com/",
		tags: ["通往异世界"],
		weight: 1,
		enabled: true,
	},
	{
		title: "Alan",
		imgurl: "https://itmoe.net/static/avatar.jpeg",
		desc: "A network engineer",
		siteurl: "https://itmoe.net",
		tags: ["通往异世界"],
		weight: 1,
		enabled: true,
	}
];

export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
