const nextBuild = require('next/dist/build').default;
const path = require('path');
process.env.NODE_ENV = 'production';
nextBuild(path.resolve('.'), false, false, false, false, false, false, false, 'default')
  .then(() => console.log('Build succeeded!'))
  .catch(err => {
    console.error('Build failed with error:');
    console.error(err.stack || err);
  });
