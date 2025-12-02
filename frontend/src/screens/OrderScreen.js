import React, { useEffect } from "react";
import { Row, Col, ListGroup, Image, Card } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getOrderDetails, payOrder } from "../actions/orderActions";
import { ORDER_PAY_RESET } from "../constants/orderConstants";
import axios from "axios";

// PayPal (Modern React SDK)
import {
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";

function OrderScreen() {
    const { id } = useParams();
    const dispatch = useDispatch();

    // Redux: order details
    const orderDetails = useSelector((state) => state.orderDetails);
    const { order, loading, error } = orderDetails;

    // Redux: payment state
    const orderPay = useSelector((state) => state.orderPay);
    const { loading: loadingPay, success: successPay } = orderPay;

    // PayPal React SDK
    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

    // PayPal load function MUST be above useEffect
    const loadPayPalScript = async () => {
        const { data: clientId } = await axios.get("/api/orders/config/paypal/");

        paypalDispatch({
            type: "resetOptions",
            value: {
                "client-id": clientId,
                currency: "USD",
            },
        });

        paypalDispatch({
            type: "setLoadingStatus",
            value: "pending",
        });
    };

    useEffect(() => {
        if (!order || order._id !== Number(id) || successPay) {
            dispatch({ type: ORDER_PAY_RESET });
            dispatch(getOrderDetails(id));
        } else if (!order.isPaid) {
            loadPayPalScript();
        }
    }, [dispatch, id, successPay]);


    // PayPal payment success handler
    const successPaymentHandler = (paymentResult) => {
        dispatch(payOrder(id, paymentResult));
    };

    if (loading) return <Loader />;
    if (error) return <Message variant="danger">{error}</Message>;

    return (
        <div>
            <h1>Order {order._id}</h1>

            <Row>
                <Col md={8}>
                    <ListGroup variant="flush">

                        {/* SHIPPING INFO */}
                        <ListGroup.Item>
                            <h2>Shipping</h2>
                            <p>
                                <strong>Name:</strong> {order.user.name}
                            </p>
                            <p>
                                <strong>Email:</strong>{" "}
                                <a className="email-link" href={`mailto:${order.user.email}`}>
                                    {order.user.email}
                                </a>
                            </p>
                            <p>
                                <strong>Address:</strong>{" "}
                                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                                {order.shippingAddress.postalCode},{" "}
                                {order.shippingAddress.country}
                            </p>

                            {order.isDelivered ? (
                                <Message variant="success">Delivered on {order.deliveredAt}</Message>
                            ) : (
                                <Message variant="warning">Not Delivered</Message>
                            )}
                        </ListGroup.Item>

                        {/* PAYMENT INFO */}
                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <p>
                                <strong>Method:</strong> {order.paymentMethod}
                            </p>
                            {order.isPaid ? (
                                <Message variant="success">Paid on {order.paidAt}</Message>
                            ) : (
                                <Message variant="warning">Not Paid</Message>
                            )}
                        </ListGroup.Item>

                        {/* ITEMS */}
                        <ListGroup.Item>
                            <h2>Order Items</h2>
                            {order.orderItems.length === 0 ? (
                                <Message>Order is empty</Message>
                            ) : (
                                <ListGroup variant="flush">
                                    {order.orderItems.map((item) => (
                                        <ListGroup.Item key={item.product}>
                                            <Row>
                                                <Col md={2}>
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fluid
                                                        rounded
                                                    />
                                                </Col>

                                                <Col>
                                                    <Link to={`/product/${item.product}`}>
                                                        {item.name}
                                                    </Link>
                                                </Col>

                                                <Col md={4}>
                                                    {item.qty} × ${item.price} = $
                                                    {(item.qty * item.price).toFixed(2)}
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </ListGroup.Item>

                    </ListGroup>
                </Col>

                {/* ORDER SUMMARY + PAYPAL BUTTON */}
                <Col md={4}>
                    <Card>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <h2>Order Summary</h2>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Items</Col>
                                    <Col>${order.itemsPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping</Col>
                                    <Col>${order.shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax</Col>
                                    <Col>${order.taxPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Total</Col>
                                    <Col>${order.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            {/* PAYPAL BUTTON */}
                            {!order.isPaid && (
                                <ListGroup.Item>
                                    {loadingPay || isPending ? (
                                        <Loader />
                                    ) : (
                                        <PayPalButtons
                                            createOrder={(data, actions) => {
                                                return actions.order.create({
                                                    purchase_units: [
                                                        {
                                                            amount: {
                                                                value: order.totalPrice,
                                                            },
                                                        },
                                                    ],
                                                });
                                            }}
                                            onApprove={async (data, actions) => {
                                                const details = await actions.order.capture();
                                                successPaymentHandler(details);
                                            }}
                                        />
                                    )}
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default OrderScreen;
