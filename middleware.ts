import { ipAddress, next } from '@vercel/edge'
import { Ratelimit } from '@upstash/ratelimit'
import { kv } from '@vercel/kv'
import {NextResponse} from "next/server";

const ratelimit = new Ratelimit({
    redis: kv,
    // 10 requests from the same IP in 10 seconds
    limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export const config = {
    matcher: ['/api/coupons'],
}

export default async function middleware(
    request: Request
) {
    // You could alternatively limit based on user ID or similar
    const ip = ipAddress(request) || '127.0.0.1'
    const { success, pending, limit, reset, remaining } = await ratelimit.limit(
        ip
    )

    return success ? next() : NextResponse.json({ "errorMessage": '少し時間おいてからもう一度試してみてください' }, { status: 429 })
}