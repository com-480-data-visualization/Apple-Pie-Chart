/** @type {import('next').NextConfig} */
const repoName = 'Apple-Pie-Chart';
const isGhPages = process.env.NEXT_PUBLIC_GH_PAGES === 'true';   // 环境变量开关

export default {
  output: 'export',
  images: { unoptimized: true },
  basePath:  isGhPages ? `/${repoName}` : '',
  assetPrefix: isGhPages ? `/${repoName}/` : ''
};