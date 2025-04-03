/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NODE_ENV === 'production' ? {
    output: 'export',
    basePath: '/music-scale-visualizer',
  } : {}),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 