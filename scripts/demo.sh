cd $(dirname "$0")/..
pnpm build
mkdir -p dist/demo
cp dist/index.iife.js dist/demo/

GIT_COMMIT=$(git rev-parse --short HEAD)
sed "s/window\.__COMMIT__/\"$GIT_COMMIT\"/g" scripts/demo.html > dist/demo/index.html
