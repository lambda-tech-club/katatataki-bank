'use client'
import React from 'react';
import {FormEvent, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'

export default function All() {
    const [createMessage, setCreateMessage] = useState<JSX.Element>(<></>)
    const [submitCreateDisabled, setSubmitCreateDisabled] = useState(false)

    async function onSubmitCreate(event: FormEvent<HTMLFormElement>) {
        setSubmitCreateDisabled(true)
        setCreateMessage(<div className="card text-bg-dark">
            <div className="card-body">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>)

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
                setCreateMessage(<div className="card text-bg-dark">
                <div className="card-body">
                    {"シリアルコード:" + `${couponCode.substring(0, 4)}-${couponCode.substring(4, 8)}-${couponCode.substring(8, 12)}`}
                </div>
            </div>)
                break
            default:
                setCreateMessage(<div className="card text-bg-warning">
                <div className="card-body">
                    何らかの理由で失敗しました
                </div>
            </div>)
        }
        setSubmitCreateDisabled(false)
    }

    return (
        <div className="container">
            <h1>券発行フォーム</h1>
            <form className="needs-validation" onSubmit={onSubmitCreate}>
                <div className="form-floating mb-3">
                    <input className="form-control form-control-lg" type="number" id="number" name="number" required minLength={1} maxLength={10}/>
                    <label className="form-label" htmlFor="number">回数</label>
                </div>
                <div className="form-floating mb-3">
                    <input className="form-control form-control-lg" type="date" id="expiredAt" name="expiredAt"/>
                    <label className="form-label" htmlFor="expiredAt">有効期限</label>
                </div>
                <div className="form-floating mb-3">
                    <input className="form-control form-control-lg" type="number" id="watchWord" name="watchWord" required minLength={5} maxLength={5}/>
                    <label className="form-label" htmlFor="watchWord">合言葉</label>
                </div>
                <button className="btn btn-primary btn-lg mb-3" type="submit" disabled={submitCreateDisabled}>発行する</button>
            </form>
            {createMessage}
        </div>
    )
}
