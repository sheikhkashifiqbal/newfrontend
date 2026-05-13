/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.myscope.vip',
  generateRobotsTxt: true, // creates robots.txt automatically
  sitemapSize: 7000,

  exclude: [
    '/admin/*',
    '/dashboard/*',
    '/api/*',
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
}