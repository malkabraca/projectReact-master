import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Image,
  ListGroup,
  Row,
  Spinner,
} from "react-bootstrap";
import { BsCardHeading, BsCurrencyDollar, BsListUl } from "react-icons/bs";
import CardMenu from "../components/CardMenu";
import { toast } from "react-toastify";
import useQueryParams from "../hooks/useQueryParams";
import { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ButtonCreatCom from "../components/ButtonCreatCom";
import CompletionOfAnOrder from "../components/OrderSummaryCom";
import "../css/menuPage.css";
const MenuPage = () => {
  const [originalCardsArr, setOriginalCardsArr] = useState(null);
  const [cardsArr, setCardsArr] = useState(null);
  const [orderIdMenu, setOrderIdMenu] = useState(null);
  const [listOrCard, setListOrCard] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const navigate = useNavigate();
  let qparams = useQueryParams();
  const payload = useSelector((bigPie) => bigPie.authSlice.payload);

  const isLoggedIn = useSelector(
    (bigPieBigState) => bigPieBigState.authSlice.isLoggedIn
  );
  const id = jwt_decode(localStorage.token)._id;

  useEffect(() => {
    axios
      .get("/cards")
      .then(({ data }) => {
        filterFunc(data);
      })
      .catch((err) => {
        toast.error("err from axios" + "" + err.response.data);
      });
  }, []);

  useEffect(() => {
    const withdrawalOfOrderId = async () => {
      try {
        const order = await axios.get("/orders/my-order-findOne/" + id);
        setOrderIdMenu(order.data);
      } catch (err) {
        toast.error(err.response._id);
      }
    };
    withdrawalOfOrderId();
  }, [orderIdMenu]);

  const filterFunc = (data) => {
    if (!originalCardsArr && !data) {
      return;
    }
    let filter = "";
    if (qparams.filter) {
      filter = qparams.filter;
      console.log(filter);
    }
    if (!originalCardsArr && data) {
      /*
      when component loaded and states not loaded
      */
      setOriginalCardsArr(data);
      setCardsArr(
        data.filter(
          (card) => card.title.startsWith(filter)
          // || card.bizNumber.startsWith(filter)
        )
      );
      return;
    }
    if (originalCardsArr) {
      /*
        when all loaded and states loaded
        */
      let newOriginalCardsArr = JSON.parse(JSON.stringify(originalCardsArr));
      setCardsArr(
        newOriginalCardsArr.filter(
          (card) => card.title.startsWith(filter)
          // || card.bizNumber.startsWith(filter)
        )
      );
    }
  };

  useEffect(() => {
    filterFunc();
  }, [qparams.filter]);

  const handleDeleteFromInitialCardsArr = async (id) => {
    try {
      await axios.delete("/cards/" + id);
      setCardsArr((newCardsArr) =>
        newCardsArr.filter((item) => item._id != id)
      );
    } catch (err) {
      toast.error(err.response.data);
    }
  };
  const handleEditFromInitialCardsArr = (id) => {
    console.log("captor");
    const cardToEdit = cardsArr.find((card) => card._id == id);
    navigate(`/edit/${id}`, { state: { user_id: cardToEdit.user_id } });
  };

  if (!cardsArr) {
    return <Spinner animation="border" role="status"></Spinner>;
  }
  const deleteHome = () => {};

  const handelListOrCard = () => {
    setListOrCard(!listOrCard);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };
  const categories = [
    "Main dishes",
    "drinking",
    "Category 3",
    "Category 4",
    "Category 5",
  ];

  const filterItemsByCategory = (category) => {
    return cardsArr.filter((item) => item.category === category);
  };

  return (
    <Container>
      <Button
        variant="warning"
        className="buttonList"
        onClick={handelListOrCard}
      >
        {listOrCard ? <BsCardHeading /> : <BsListUl />}
      </Button>

      <div>
        <h1 className="title"> menu</h1>
        <ButtonCreatCom canCreate={payload && payload.isAdmin} />
        <Row>
          {categories.map((category) => (
            <div key={category}>
              <h3 className="subtitleh2">{category}</h3>
              {filterItemsByCategory(category).map((item) => (
                <CardMenu
                  key={item._id + Date.now()}
                  id={item._id}
                  imageUrl={item.imageUrl}
                  imageAlt={item.imageAlt}
                  title={item.title}
                  description={item.description}
                  price={item.price}
                  orderId={orderIdMenu}
                  onDelete={handleDeleteFromInitialCardsArr}
                  onEdit={handleEditFromInitialCardsArr}
                  canEdit={payload && payload.isAdmin}
                  canDelete={payload && payload.isAdmin}
                  canEd={!(payload && payload.isAdmin)}
                  canFav={payload}
                  listOrCard={listOrCard}
                />
              ))}
            </div>
          ))}
        </Row>
      </div>
      <CompletionOfAnOrder variant="warning" orderId={orderIdMenu} />

      {/* <ButtonCreatCom /> */}
    </Container>
  );
};

export default MenuPage;
