import React, {useEffect, useState} from "react";
import ReactDOM from 'react-dom/client';

const apiFetchBookedRooms =  () => {
   return fetch('http://localhost:8080/api/rooms/bookRandom',{
    method: 'POST',
    headers: {
        'Content-Type' : 'application/json',
    },
   })
   .then(response => response.json())
   .then(data => data)
   .catch(error => {
    console.error("Error fetching booked rooms: ", error);
    return [];
   })
};

const apiFetchAllBookedRooms = () => {
    return fetch('http://localhost:8080/api/rooms/getBookedRooms',{
        method: 'GET',
        headers: {
            'Content-Type' : 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => data)
    .catch(error => {
     console.error("Error fetching booked rooms: ", error);
     return [];
    })
}

const apiResetRooms = () => {
    return fetch('http://localhost:8080/api/rooms/reset',{
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
       })
       .then(response => response.json())
       .then(data => data)
       .catch(error => {
        console.error("Error fetching booked rooms: ", error);
        return [];
       })
}

const apiBookRooms = (roomCount) => {
    return fetch('http://localhost:8080/api/rooms/book',{
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
        },
        body: JSON.stringify({numberOfRooms: roomCount}),
    })
    .then(response => response.json())
    .then(data => data)
    .catch(error => {
        console.error("Error fetching booked rooms", error);
        return [];
    });
    
}

const Building = ({ bookedRooms, bookedByUserRooms }) => {
    const floors = Array.from({ length: 10}, (_, i) => {
        const floorNumber = 10 - i;
        const roomsCount = floorNumber === 10 ? 7 : 10;
        const floorPrefix = floorNumber;

        return (
            <div className="floor" key={floorNumber}>
                <div className="rooms">
                    {Array.from({ length: roomsCount }, (_, j) => {
                        const roomNumber = `${floorPrefix}${(j + 1)< 10 ? '0' : ''}${j+1}`;

                        const isBooked = bookedRooms.includes(parseInt(roomNumber));
                        const isBookedByUser = bookedByUserRooms.includes(parseInt(roomNumber));

                        return (
                            <div 
                            className={`room ${isBooked ? 'booked' : ''} ${isBookedByUser ? 'booked-by-user' : ''}`}
                            key={roomNumber}
                            > </div>
                        );
                    })}
                </div>
            </div>
        );
    });

    return (
        <div className="building">
            <div className="lift"></div>
            <div>{floors}</div>
        </div>
    );
};

const AppLayout = () => {
    const [roomCount, setRoomCount] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [bookedRooms, setBookedRooms] = useState([]);
    const [bookedByUserRooms, setBookedByUserRooms] = useState([]);

    useEffect(() => {
        apiFetchAllBookedRooms().then((bookedRoomsFromAPI) => {
            setBookedRooms(bookedRoomsFromAPI);
        });
    }, []);

    const handleInputChange = (event) => {
        const value = event.target.value;
        setRoomCount(value);

        if (value === '') {
            setErrorMessage('');
        } else if(value < 1 || value > 5) {
            setErrorMessage("Please enter a value between 1 and 5");
        } else {
            setErrorMessage('');
        }
    };

    const isBookButtonDisabled = (roomCount < 1 || roomCount > 20 || roomCount === '');

    const handleRandom = () => {
        console.log("Fetching booked rooms...");
        apiFetchBookedRooms().then((bookedRoomsFromAPI) => {
            console.log("Booked Rooms:", bookedRoomsFromAPI);
            setBookedRooms(bookedRoomsFromAPI);
        });
    };

    const handleBook = () => {
        console.log('Booking selected rooms....');
        apiBookRooms(roomCount).then((bookedRoomsFromAPI) => {
            console.log('Booked rooms by user:', bookedRoomsFromAPI);
            const bookedRoomNumbers = bookedRoomsFromAPI.bookedRoomNumbers;
            setBookedByUserRooms(prevBookedByUserRooms => [...prevBookedByUserRooms, ...bookedRoomNumbers]);
            setBookedRooms(prevBookedRooms => [...new Set([...prevBookedRooms, ...bookedRoomNumbers])])
        })
    }

    const handleReset = () => {
        console.log("Resetting all rooms...");
        apiResetRooms();
        setBookedRooms([]);
        setBookedByUserRooms([]);
    };

    return (
        <div className="app-layout">
            <div className="layout">
                <input
                className="input"
                type="number"
                placeholder="No of Rooms"
                min="1"
                max="5"
                value={roomCount}
                onChange={handleInputChange
                }/>

                <button
                className="button"
                onClick={handleBook}
                disabled={isBookButtonDisabled}>Book</button>

                <button
                className="button"
                onClick={handleReset}>
                    Reset
                </button>

                <button
                className="button"
                onClick={handleRandom}>
                    Random
                </button>
            </div>


            <Building
            bookedRooms={bookedRooms}
            bookedByUserRooms={bookedByUserRooms}
            />

            {errorMessage && <div className="error-message">{errorMessage}</div>}

        </div>

    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AppLayout />);