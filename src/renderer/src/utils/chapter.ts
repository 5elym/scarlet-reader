export interface Chapter {
  label: string
  href: string
  subitems?: Chapter[] // Notice we added the optional subitems here
}
