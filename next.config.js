module.exports = {
  output: 'export', // Untuk static export (akan menghasilkan folder 'out')
  distDir: process.env.NODE_ENV === 'production' ? '.next' : 'out'
}