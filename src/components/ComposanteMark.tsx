import { assetUrl } from '../lib/assetUrl'
import { hasComposanteMark } from './composanteMarkSvg'

type Props = {
  theme: string
  name: string
  /** Real artwork — only Jeun'ESS has pre-existing composante logos. */
  markUrl?: string
}

/**
 * Jeun'ESS: real logo artwork (full colour when active, grey when idle).
 * Other projects: text name only.
 */
export default function ComposanteMark({ theme, name, markUrl }: Props) {
  if (hasComposanteMark(theme, name, markUrl)) {
    return <img className="pj-pick__mark-img" src={assetUrl(markUrl!)} alt="" />
  }

  return <span className="pj-pick__mark-text">{name}</span>
}
