'use client'
import React from 'react';
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Update() {
    const [updateMessage, setUpdateMessage] = useState<JSX.Element>(<></>)
    const [submitUpdateDisabled, setSubmitUpdateDisabled] = useState(false)
    const [serialNumber, setSerialNumber] = useState("")

    useEffect(() => {
        setSerialNumber(new URL(location.href).searchParams.get('sn') ?? '')
    }, [])

    function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
        const value = Array.from(event.target.value.replace(/[^0-9]/g, ''))
        const splitValue = value.reduce((acc: string[], curr, index) => {
            if (index % 4 === 0) {
                return [...acc, value.slice(index, index + 4).join('')];
            }
            return acc;
        }, [] as string[])
        if (value.length <= 12) setSerialNumber(splitValue.join('-'));
    }

    async function onSubmitUpdate(event: FormEvent<HTMLFormElement>) {
        setSubmitUpdateDisabled(true)
        setUpdateMessage(<div className="card text-bg-dark">
            <div className="card-body">
                <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>)

        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        formData.set("serialNumber", serialNumber.replace(/[^0-9]/g, ''))
        const response = await fetch('/api/coupons', {
            method: 'PUT',
            body: JSON.stringify(Object.fromEntries(formData)),
        })

        const data = await response.json()
        if (!!data['errorMessage']) {
            setUpdateMessage(<div className="card text-bg-danger">
                <div className="card-body">
                    {data['errorMessage']}
                </div>
            </div>)
        } else {
            setUpdateMessage(<div className="card text-bg-success">
                <div className="card-body">
                    {data['message']}
                </div>
            </div>)
        }
        setSubmitUpdateDisabled(false)
    }

    return (
        <div className="container mt-[30%]">
            <h1>券を利用する</h1>
            <form onSubmit={onSubmitUpdate}>
                <div className="form-floating mb-3">
                    <input value={serialNumber} onChange={handleOnChange} className="form-control form-control-lg" type="text" id="serialNumber" name="serialNumber" required/>
                    <label className="form-label" htmlFor="serialNumber">シリアル番号</label>
                </div>
                <div className="form-floating mb-3">
                    <input className="form-control form-control-lg" type="number" id="passCode" name="passCode" required minLength={5} maxLength={5}/>
                    <label className="form-label" htmlFor="passCode">パスコード</label>
                </div>
                <button className="btn btn-primary btn-lg mb-3" type="submit" disabled={submitUpdateDisabled}>利用する</button>
            </form>
            {updateMessage}
        </div>
    )
}
