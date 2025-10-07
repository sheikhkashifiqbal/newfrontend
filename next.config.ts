import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/i,
			use: ["@svgr/webpack"],
		})
		return config;
	},
	experimental: {
		turbo: {
			rules: {
				'*.svg': {
					loaders: ['@svgr/webpack'],
					as: '*.js'
				}
			}
		}
	},
	eslint:{
		ignoreDuringBuilds: true
	},
	async redirects() {
		return [
			{
				source: '/',
				destination: '/services',
				permanent: true
			}
		]
	}
};

export default nextConfig;
