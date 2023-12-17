/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.ignoreWarnings = [
      {
        module: /@ffmpeg\/ffmpeg/,
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },
};

module.exports = nextConfig;
