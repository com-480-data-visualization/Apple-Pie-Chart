/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // use static export
  images: {
    unoptimized: true      // Turn off built-in image optimization
  }
};

export default nextConfig;
