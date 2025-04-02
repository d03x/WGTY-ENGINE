import P from "pino";

export const logger = (log_dest?: string) => {
    return P({
        level: "silent",
        timestamp() {
            return `time:"${new Date().toJSON()}"`;
        },
    }, P.destination(log_dest))
}