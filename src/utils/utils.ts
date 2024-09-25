export const capitolizeLocation = (str: string) => {
    // console.log("Capitolize Location", str);
    return
    if (!str) return '';
    const locationArray = str.split(' ');
    const locality = locationArray[0] && (locationArray[0].charAt(0).toUpperCase() + locationArray[0].slice(1));
    const region = locationArray[1] && ((locationArray[1].length < 4) ?
        locationArray[1].toUpperCase() :  
        locationArray[1].charAt(0).toUpperCase() + locationArray[1].slice(1));
    const country = locationArray[2] && ((locationArray[2].length < 4) ?
        locationArray[2].toUpperCase() :  
        locationArray[2].charAt(0).toUpperCase() + locationArray[2].slice(1));
    const country2 = locationArray[3] && ((locationArray[3].length < 4) ?
        locationArray[3].toUpperCase() :  
        locationArray[3].charAt(0).toUpperCase() + locationArray[3].slice(1));
    const country3 = locationArray[4] && ((locationArray[4].length < 4) ?
        locationArray[4].toUpperCase() :  
        locationArray[4].charAt(0).toUpperCase() + locationArray[4].slice(1));
    return `${locality} ${region || ''} ${country || ''} ${country2 || ''} ${country3 || ''}`;
}
