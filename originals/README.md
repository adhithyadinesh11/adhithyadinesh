# Full-resolution originals

Untouched masters of every photo, kept as the backup.

`assets/images/` holds web-sized versions: gallery photos capped at
2000px, `about.jpg` at 1400px, plus 640px thumbnails under
`assets/images/gallery/thumb/`. That took the site from 41 MB to under
3 MB on a phone.

Nothing on the site links here. It exists so the masters are never lost.

## Re-generating a web version

    sips -Z 2000 -s format jpeg -s formatOptions 80 \
      originals/gallery/1.jpg --out assets/images/gallery/1.jpg

    sips -Z 640 -s format jpeg -s formatOptions 72 \
      originals/gallery/1.jpg --out assets/images/gallery/thumb/1.jpg

Check the result is actually smaller before keeping it. Several photos
here were already small and well compressed, and re-encoding them made
them larger while costing a generation of quality.
