/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow development from localhost and 127.0.0.1
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    'localhost:3001',
    '127.0.0.1:3001'
  ]
};

export default nextConfig;
