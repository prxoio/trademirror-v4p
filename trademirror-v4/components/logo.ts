// show logo at the startup

export function showLogo() {
  const logo = `
\x1b[34m
         __              __              ____                __
   _____/ /_  ____ _____/ ____ _      __/ ____  ______  ____/ /
  / ___/ __ \\/ __ \`/ __  / __ | | /| / / /_/ / / / __ \\/ __  / 
 (__  / / / / /_/ / /_/ / /_/ | |/ |/ / __/ /_/ / / / / /_/ /  
/____/_/ /_/\\__,_/\\__,_/\\____/|__/|__/_/  \\__,_/_/ /_/\\__,_/   
\x1b[0m
`

  console.log(logo)
  console.log('\x1b[34m%s\x1b[0m \x1b[36m%s\x1b[0m', 'trademirror', 'v4.0.1')
  console.log('\x1b[92m%s\x1b[0m', 'Starting..........')
  console.log(' ')
}
