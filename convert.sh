#!/bin/bash
path=src/sprites
rm -r "$path"
mkdir -p "$path"
for f in sprite_source/*; do
    target="$path/$(basename "${f%.*}").txt"
    magick "$f" -transparent white "$target"-trans
    ./node_modules/@cofy-x/pixel-to-ascii/dist/cli.js "$target"-trans \
        | perl -pe 's/\e\[38;2;(\d+;\d+;\d+)m\e\[48;2;\1m▀/█/g;
s/\e\[48;2;\d+;\d+;\d+m▄/▀/g;
s/\e\[[0-9;?]*[A-Za-z]//g;' \
        | sed -e '1s/^▀/ /' -e 's/[[:space:]]*$//' \
            > "$target"
    rm "$target"-trans
    cat "$target"
done
