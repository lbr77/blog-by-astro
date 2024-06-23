import {createHash} from "node:crypto"

export function sign(data: string) {
    const hash = createHash("sha256")
    return hash.update(data).digest("hex");
}

export function getPid(data) {
    return sign(data.data.slug).slice(0, 6);
}