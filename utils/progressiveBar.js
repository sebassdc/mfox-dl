
module.exports = ({
  value,
  length=40,
  title = " ",
  vmin=0.0,
  vmax=1.0,
  progressive = false
}) => {
  // Block progression is 1/8
  const blocks = ["", "▏","▎","▍","▌","▋","▊","▉","█"]
  const lsep = "▏", rsep = "▕"
  
  // Normalize value
  const normalized_value = (Math.min(Math.max(value, vmin), vmax)-vmin)/Number(vmax-vmin)
  const v = normalized_value * length
  const x = Math.floor(v) // integer part
  const y = v - x         // fractional part
  const i = Math.round(y*8)
  const bar = Array(x).fill("█").join("") + blocks[i]
  const remaining = Array(length - bar.length).fill(" ").join("")
  return `${title} ${lsep}${bar}${!progressive ? remaining : ""}${rsep} ${(Math.round(normalized_value * 100 * 100) / 100)}%`
}