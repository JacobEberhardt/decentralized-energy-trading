export const wsToKWh = ws => {
    const divisonFactor = 3600000;
    let kWh = ws / divisonFactor;
    return Number(kWh.toFixed(4));
}