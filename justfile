lint:
    npx eslint src/**/* --config .eslint.config.mjs

format:
    npx eslint src/**/* --config .eslint.config.mjs --fix

protocol:
    temp_dir=$(mktemp -d) && trap 'rm -rf "$temp_dir"' EXIT && curl --fail --silent --show-error --location https://raw.githubusercontent.com/TOPLLab/WARDuino/7805f0bc87e79c55c151788a279f2ecb13e0fa7a/src/Debug/debug.proto --output "$temp_dir/debug.proto" && protoc --proto_path="$temp_dir" --plugin=protoc-gen-ts_proto=node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=src/protocol/vendor --ts_proto_opt=env=node,forceLong=bigint,useOptionals=messages,outputEncodeMethods=true,outputJsonMethods=false "$temp_dir/debug.proto"
