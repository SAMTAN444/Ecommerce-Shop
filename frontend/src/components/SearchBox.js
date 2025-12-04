import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'

function SearchBox() {

    const [keyword, setKeyword] = useState('')
    const navigate = useNavigate()

    const submitHandler = (e) => {
        e.preventDefault()

        const trimmed = keyword.trim()
        if (trimmed) {
            navigate(`/?keyword=${trimmed}&page=1`)
        } else {
            navigate('/')
        }
    }
    return (
        <Form className='d-flex' onSubmit={submitHandler}>
            <Form.Control
                type='text'
                name='searchBox'
                placeholder='Search Products...'
                className='mr-sm-2 ml-sm-5'
                onChange={(e) => setKeyword(e.target.value)}
            ></Form.Control>
            <Button type='submit' variant='outline-success' className='p-2 mx-2'>
                Search
            </Button>
        </Form>
    )
}

export default SearchBox
