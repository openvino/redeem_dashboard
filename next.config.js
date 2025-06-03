// next.config.js

const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: "/api/:path*",
				headers: [
					{
						key: "Access-Control-Allow-Origin",
						value: "*",
					},
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
					},
					{
						key: "Access-Control-Allow-Headers",
						value:
							"X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
					},
					{
						key: "Access-Control-Allow-Credentials",
						value: "true",
					},
				],
			},
		];
	},

	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},

	webpack(config) {
		config.module.rules.push({
			test: /\.sol$/,
			use: "raw-loader",
			include: path.resolve(__dirname, "contracts/flattened"),
		});
		return config;
	},
};

module.exports = nextConfig;
