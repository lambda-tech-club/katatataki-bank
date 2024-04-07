'use client'
import React from 'react';
import {FormEvent, useState } from "react";

export default function All() {
    const [createMessage, setCreateMessage] = useState("")
    const [updateMessage, setUpdateMessage] = useState("")
    const [submitCreateDisabled, setSubmitCreateDisabled] = useState(false)
    const [submitUpdateDisabled, setSubmitUpdateDisabled] = useState(false)

    async function onSubmitCreate(event: FormEvent<HTMLFormElement>) {
        setSubmitCreateDisabled(true)
        setCreateMessage("処理中")

        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const response = await fetch('/api/coupons', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
        })

        switch (response.status) {
            case 200:
                const data = await response.json()
                const couponCode = data['couponCode']
                setCreateMessage("あなたのコードは:" + `${couponCode.substring(0, 4)}-${couponCode.substring(4, 8)}-${couponCode.substring(8, 12)}`)
                break
            default:
                setCreateMessage("すまん、多分なんならかの理由で失敗した")
        }
        setSubmitCreateDisabled(false)
    }

    async function onSubmitUpdate(event: FormEvent<HTMLFormElement>) {
        setSubmitUpdateDisabled(true)
        setUpdateMessage("処理中")

        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const response = await fetch('/api/coupons', {
            method: 'PUT',
            body: JSON.stringify(Object.fromEntries(formData)),
        })

        const data = await response.json()
        switch (response.status) {
            case 200:
                setUpdateMessage(data['message'])
                break
            case 400:
                setUpdateMessage("知らない利用番号ですね")
                break
            case 403:
                setUpdateMessage("不正はよくないですね")
                break
            default:
                setCreateMessage("すまん、多分なんならかの理由で失敗した")
        }
        setSubmitUpdateDisabled(false)
    }

    return (
        <div>
            <h1>作成する</h1>
            <form onSubmit={onSubmitCreate}>
                <label htmlFor="watchWord">合言葉</label>
                <input type="number" id="watchWord" name="watchWord" required minLength={5} maxLength={5}/>
                <label htmlFor="expiredAt">有効期限</label>
                <input type="date" id="expiredAt" name="expiredAt"/>
                <label htmlFor="number">回数</label>
                <input type="number" id="number" name="number" required minLength={1} maxLength={10}/>
                <button type="submit" disabled={submitCreateDisabled}>Submit</button>
            </form>
            {<span>{createMessage}</span>}

            <h1>利用する</h1>
            {/* 利用する方*/}
            <form onSubmit={onSubmitUpdate}>
                <label htmlFor="couponCode">利用番号</label>
                <input type="number" id="couponCode" name="couponCode" required minLength={12} maxLength={12}/>
                <label htmlFor="watchWord">合言葉</label>
                <input type="number" id="watchWord" name="watchWord" required minLength={5} maxLength={5}/>
                <button type="submit" disabled={submitUpdateDisabled}>Submit</button>
            </form>
            {<span>{updateMessage}</span>}
        </div>
    )
}
