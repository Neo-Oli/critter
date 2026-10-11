#!/bin/bash
path=src/sprites
rm -rf "$path"
mkdir -p "$path"
while IFS= read -r -d '' source; do
    relative=${source#sprite_source/}
    target="$path/${relative%.*}.txt"
    mkdir -p "$(dirname "$target")"
    if [[ ! -s "$source" ]]; then
        : > "$target"
        continue
    fi
    magick "$source" -transparent white "$target"-trans
    ./node_modules/@cofy-x/pixel-to-ascii/dist/cli.js "$target"-trans \
        | perl -pe 's/\e\[38;2;(\d+;\d+;\d+)m\e\[48;2;\1m▀/█/g;
s/\e\[48;2;\d+;\d+;\d+m▄/▀/g;
s/\e\[[0-9;?]*[A-Za-z]//g;' \
        | sed -e '1s/^▀/ /' -e 's/[[:space:]]*$//' \
            > "$target"
    rm "$target"-trans
    cat "$target"
done < <(find sprite_source -type f -name '*.png' -print0)
