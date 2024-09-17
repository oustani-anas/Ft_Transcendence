const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
				{
					protocol: 'https',
					hostname: "cdn.intra.42.fr",
				},
				{
					protocol: 'https',
					hostname: "res.cloudinary.com",
				}
        ],
    },
};

module.exports = nextConfig