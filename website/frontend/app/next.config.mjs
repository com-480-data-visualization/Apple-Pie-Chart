/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // use static export
  images: {
    unoptimized: true      // Turn off built-in image optimization
  },
  basePath: '/Apple-Pie-Chart',
  assetPrefix: '/Apple-Pie-Chart/',
};

export default nextConfig;
