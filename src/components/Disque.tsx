import { DISQUE } from '../data/disque'

/**
 * The comp's dashed disc, drawn rather than cropped out of a picture.
 *
 * It appears twice on the page — under the vision band's seam and over the territoires band's —
 * and both times it does two things a bitmap in a band could not: it runs off the right edge of
 * the page, and it straddles the seam, painting over the band above as well as the one it
 * belongs to. The old version was a crop of a rendered page sitting inside one band, so it was
 * soft at every zoom and stopped dead at the seam.
 *
 * Drawn at its full size inside a wrapper that runs from the drawing's own left edge to the
 * window's, so the wrapper is what crops it. That is the only way to bleed here: the drawing
 * has to escape the band upwards, which rules out the band clipping, and it has to be cut off
 * at the right, which rules out nothing clipping. The placement rules give the wrapper its
 * left edge; see .disque in apropos.css for why that is measured from the canvas.
 */
export default function Disque({ className }: { className?: string }) {
  return (
    <div className={className ? `disque ${className}` : 'disque'} aria-hidden="true">
      <svg
        viewBox={`0 0 ${DISQUE.width} ${DISQUE.height}`}
        width={`${DISQUE.width / 10}rem`}
        height={`${DISQUE.height / 10}rem`}
        focusable="false"
      >
        {/* Hairline stroke in the fill's own colour. The vision band's pink still comes from a
            plate that has the bottom sliver of this disc baked into its corner, and this covers
            that sliver's antialiased edge rather than leaving a thread of it showing round the
            live drawing. It grows the shape by half a comp pixel, which at this size is nothing. */}
        <path
          fill={DISQUE.outlineFill}
          stroke={DISQUE.outlineFill}
          strokeWidth="1.5"
          d={DISQUE.outline}
        />
        <path fill={DISQUE.dashFill} d={DISQUE.dashes} />
      </svg>
    </div>
  )
}
