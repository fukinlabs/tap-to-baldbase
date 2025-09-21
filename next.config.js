/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  // Turbopack configuration
  turbopack: {
    root: './'
  }
}

module.exports = nextConfig