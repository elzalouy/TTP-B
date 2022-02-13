export const trelloApi= (service:string):string => {
    let url = `https://api.trello.com/1/${service}key=${process.env.TRELLO_KEY}&token=${process.env.TRELLO_TOKEN}`
    return url
}

