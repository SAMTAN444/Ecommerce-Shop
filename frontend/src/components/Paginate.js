import { Pagination } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function Paginate({ pages, page, keyword = '', isAdmin = false }) {

    return (
        pages > 1 && (
            <Pagination className='justify-content-center my-3'>
                {[...Array(pages).keys()].map(x => (
                    <Pagination.Item
                        key={x + 1}
                        active={x + 1 === page}
                        as={Link}
                        to={
                            !isAdmin
                                ? keyword
                                    ? `/?keyword=${keyword}&page=${x + 1}`
                                    : `/?page=${x + 1}`
                                : `/admin/productlist?page=${x + 1}`
                        }
                    >
                        {x + 1}
                    </Pagination.Item>
                ))}
            </Pagination>
        )
    )
}

export default Paginate

