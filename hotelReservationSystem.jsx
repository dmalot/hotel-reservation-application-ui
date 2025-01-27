import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const HotelReservationSystem = () => {
  // Initialize hotel structure
  const initialHotelState = () => {
    const hotel = {};
    // Floors 1-9 with 10 rooms each
    for (let floor = 1; floor <= 9; floor++) {
      hotel[floor] = {};
      for (let room = 0; room < 10; room++) {
        const roomNumber = floor * 100 + (room + 1);
        hotel[floor][roomNumber] = { occupied: false };
      }
    }
    // Floor 10 with 7 rooms
    hotel[10] = {};
    for (let room = 1; room <= 7; room++) {
      const roomNumber = 1000 + room;
      hotel[10][roomNumber] = { occupied: false };
    }
    return hotel;
  };

  const [hotel, setHotel] = useState(initialHotelState());
  const [numRooms, setNumRooms] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [error, setError] = useState('');

  // Calculate travel time between two rooms
  const calculateTravelTime = (room1, room2) => {
    const floor1 = Math.floor(room1 / 100);
    const floor2 = Math.floor(room2 / 100);
    const roomNum1 = room1 % 100;
    const roomNum2 = room2 % 100;
    
    // Vertical travel time (2 minutes per floor)
    const verticalTime = Math.abs(floor1 - floor2) * 2;
    
    // Horizontal travel time (1 minute per room)
    const horizontalTime = Math.abs(roomNum1 - roomNum2);
    
    return verticalTime + horizontalTime;
  };

  // Find best available rooms
  const findBestRooms = (numRoomsRequired) => {
    if (numRoomsRequired > 5) {
      setError('Maximum 5 rooms can be booked at a time');
      return [];
    }

    // Get all available rooms
    const availableRooms = [];
    Object.entries(hotel).forEach(([floor, rooms]) => {
      Object.entries(rooms).forEach(([roomNum, status]) => {
        if (!status.occupied) {
          availableRooms.push(parseInt(roomNum));
        }
      });
    });

    if (availableRooms.length < numRoomsRequired) {
      setError('Not enough rooms available');
      return [];
    }

    // Try to find rooms on the same floor first
    for (let floor = 1; floor <= 10; floor++) {
      const floorRooms = availableRooms.filter(room => Math.floor(room / 100) === floor);
      if (floorRooms.length >= numRoomsRequired) {
        return floorRooms.slice(0, numRoomsRequired).sort();
      }
    }

    // If rooms on same floor not available, find combination with minimum travel time
    let bestRooms = [];
    let minTotalTime = Infinity;

    // Try different combinations
    const findCombinations = (rooms, start, current) => {
      if (current.length === numRoomsRequired) {
        const totalTime = current.reduce((sum, room, idx) => {
          if (idx === 0) return 0;
          return sum + calculateTravelTime(current[idx - 1], room);
        }, 0);

        if (totalTime < minTotalTime) {
          minTotalTime = totalTime;
          bestRooms = [...current];
        }
        return;
      }

      for (let i = start; i < rooms.length; i++) {
        findCombinations(rooms, i + 1, [...current, rooms[i]]);
      }
    };

    findCombinations(availableRooms, 0, []);
    return bestRooms;
  };

  // Book rooms
  const bookRooms = () => {
    const bestRooms = findBestRooms(parseInt(numRooms));
    if (bestRooms.length === 0) return;

    const newHotel = { ...hotel };
    bestRooms.forEach(roomNum => {
      const floor = Math.floor(roomNum / 100);
      newHotel[floor][roomNum].occupied = true;
    });

    setHotel(newHotel);
    setSelectedRooms(bestRooms);
    setError('');
  };

  // Generate random occupancy
  const generateRandomOccupancy = () => {
    const newHotel = initialHotelState();
    Object.entries(newHotel).forEach(([floor, rooms]) => {
      Object.keys(rooms).forEach(roomNum => {
        newHotel[floor][roomNum].occupied = Math.random() < 0.5;
      });
    });
    setHotel(newHotel);
    setSelectedRooms([]);
    setError('');
  };

  // Reset hotel
  const resetHotel = () => {
    setHotel(initialHotelState());
    setSelectedRooms([]);
    setError('');
  };

  return (
    <div className="hotel-container">
      <div className="hotel-card">
        <div className="controls-container">
          <input
            type="number"
            min="1"
            max="5"
            value={numRooms}
            onChange={(e) => setNumRooms(e.target.value)}
            className="room-input"
            placeholder="No of rooms"
          />
          <button
            onClick={bookRooms}
            className="btn btn-secondary"
          >
            Book Rooms
          </button>
          <button
            onClick={generateRandomOccupancy}
            className="btn btn-secondary"
          >
            Random Occupancy
          </button>
          <button
            onClick={resetHotel}
            className="btn btn-secondary"
          >
            Reset
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className='building'>
        <div className="lift"></div>
        <div className="floors-container">
          {Object.entries(hotel)
            .sort((a, b) => parseInt(b[0]) - parseInt(a[0])) // Sort floors in reverse order
            .map(([floor, rooms]) => (
            <div key={floor} className="floor-card">
              <div className="rooms-grid">
                {Object.entries(rooms).map(([roomNum, status]) => (
                  <div
                    key={roomNum}
                    className={`
                      room-cell
                      ${status.occupied && !selectedRooms.includes(parseInt(roomNum)) ? 'room-occupied' : ''}
                      ${status.occupied && selectedRooms.includes(parseInt(roomNum)) ? 'room-random' : ''}
                      ${!status.occupied ? 'room-available' : ''}
                      ${selectedRooms.includes(parseInt(roomNum)) ? 'room-selected' : ''}
                    `}
                  >
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default HotelReservationSystem;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HotelReservationSystem />);