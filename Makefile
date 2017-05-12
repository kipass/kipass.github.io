
all:
	browserify ./ui.js | uglifyjs --compress > dist.min.js
	gzip --keep dist.min.js

clean:
	rm ./dist.min.js ./dist.min.js.gz

install-deps:
	npm install -g browserify uglifyjs
