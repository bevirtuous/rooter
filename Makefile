clean:
		find . -name "*error.log" -type f -delete
		find . -name "*debug.log" -type f -delete
		rm -rf ./node_modules/
		rm -rf ./cjs/
		rm -rf ./esm/
		npm install
