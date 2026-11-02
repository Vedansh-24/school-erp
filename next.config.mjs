import withPWA from 'next-pwa';

const nextConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Development mode mein disable rakh sakte hain
})({
  // Aapki purani nextConfig settings yahan hongi agar koi hain
});

export default nextConfig;