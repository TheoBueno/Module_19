// simulate getting products from DataBase
const products = [
  { name: "Gala Apples", country: "Italy", cost: 3, inStock: 10 },
  { name: "Tangerines", country: "Spain", cost: 4, inStock: 3 },
  { name: "Green Beans", country: "USA", cost: 2, inStock: 5 },
  { name: "Green Cabbage", country: "USA", cost: 1, inStock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${JSON.stringify(data)}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URL");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  // console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data


  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.find((item) => item.name === name);
  // Check if the item is in stock before adding it to the cart
    if (item && item.inStock > 0) {
      setCart( prevCart => [...prevCart, item]);

      setItems( prevItems => {
        return prevItems.map( (prevItems) => {
          if (prevItems.name === name) {
            return {
              ...prevItems,
              inStock: prevItems.inStock - 1
            }
          }
        return prevItems
        })
      })
    }
    // setCart([...cart, ...item])
    //doFetch(query);
  };
  const deleteCartItem = (index) => {
    setCart((prevCart) => {
      const removedItem = prevCart[index];
  
      // Update the product list by increasing the inStock quantity
      setItems((prevItems) => {
        return prevItems.map((prevItem) => {
          if (prevItem.name === removedItem.name) {
            return {
              ...prevItem,
              inStock: prevItem.inStock + 1,
            };
          }
          return prevItem;
        });
      });
  
      // Return the new cart without the removed item
      return prevCart.filter((item, i) => index !== i);
    });
  };
  

  // const deleteCartItem = (index) => {



  //   let newCart = cart.filter((item, i) => index != i);
  //   setCart(newCart);
  // };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {

    // let n = index + 549 + Math.floor(Math.random()*50);
    // let url = "https://picsum.photos/id/" + n + "/300/100";

    useEffect(() => {
      setItems(items)
    }, );

    return (
      <Card key={index}>
        {/* <Image src={url} ></Image> */}
        <Image src={photos[index % 4]} width={380}  ></Image>

        <Button variant="secondary" size="large">
          {item.name}: ${item.cost} / pound. Total in Stock: {item.inStock}
        </Button>
        <Button variant="danger" name={item.name} type="submit" onClick={addToCart}>Add to Cart</Button>
      </Card>
    );
  });

  let cartList = cart.map((item, index) => {
    return (
    <Accordion.Item key={1+index} eventKey={1 + index}>
        <Card>
        <Accordion.Header>
          <h4>{item.name}</h4>
        </Accordion.Header>
        <Accordion.Body onClick={() => deleteCartItem(index)}
          eventKey={1 + index}>
         from {item.country}, $ {item.cost} per pound. <b>Click to Remove X</b>
        </Accordion.Body></Card>
    </Accordion.Item>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = async (url) => {
    const result = await axios(url)
    const dataRS = result.data.data

    setItems(prevItems => {
      return prevItems.map((item, i) =>{
        return {
          ...item,
          inStock: Number(item.inStock) + Number(dataRS[i].attributes.inStock)
        }
      })
    })

    // console.log(dataRS)
    // console.log(dataRS.map(e => e.attributes))
    // console.log(dataRS.map(e => e.attributes.inStock))
    // console.log(items)
    // for (let i = 0; i < dataRS.length; i++) {
    //   newItems[i].inStock = Number(items[i].inStock) + Number(dataRS[i].attributes.inStock);
    // }
    // setItems(newItems)
    // console.log(items)

    // dataRS.map(e => {let {name, country, cost, inStock} = e.attributes, })

  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion defaultActiveKey="0">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut Total: ${finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/api/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button variant="warning" type="submit">ReStock Products</Button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
