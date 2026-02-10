import NavBar from "../navBarComponent/nav.js";

'use strict';

function SearchPage() {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        fetch("/node/api/users")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setUsers(data);
                }
            })
            .catch(error => console.error("Error fetching users:", error));
    }, []);

    const handleSearch = (event) => {
        const value = event.target.value;
        setQuery(value);

        setResults(
            value.length > 0
                ? users.filter(user => {
                    const skillMatch = Array.isArray(user.skills)
                        ? user.skills.some(skill => skill.toLowerCase().includes(value.toLowerCase()))
                        : typeof user.skills === "string" && user.skills.toLowerCase().includes(value.toLowerCase());

                    return (
                        user.name?.toLowerCase().includes(value.toLowerCase()) ||
                        user.username?.toLowerCase().includes(value.toLowerCase()) || 
                        user.bio?.toLowerCase().includes(value.toLowerCase()) ||
                        user.status?.toLowerCase().includes(value.toLowerCase()) ||
                        skillMatch ||
                        user.events_created?.some(ev =>
                            ev.toLowerCase().includes(value.toLowerCase())
                        )
                    );
                })
                : []
        );
    };

    const handleClickInside = (e) => {
        if (!e.target.closest('.user-details')) {
            inputRef.current?.focus();
        }
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
    };

    const handleBackToResults = () => {
        setSelectedUser(null);
    };

    return (
        <>
            <div className="search-container" onClick={handleClickInside}>
                <h1 className="search-title averia-text">Find People with Skills</h1>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Enter a skill, name, or event..."
                    value={query}
                    onChange={handleSearch}
                    className="search-input fustat-text"
                />

                {selectedUser ? (
                    <div className="user-details">
                        <h2>{selectedUser.name}</h2>
                        <p>
                            <strong>Skills:</strong>{" "}
                            {Array.isArray(selectedUser.skills)
                                ? selectedUser.skills.join(', ')
                                : selectedUser.skill || 'N/A'}
                        </p>
                        <p>
                            <strong>Description:</strong>{" "}
                            {selectedUser.description || selectedUser.bio || 'No description available.'}
                        </p>
                        <p>
                            <strong>Events:</strong>{" "}
                            {Array.isArray(selectedUser.events_created) && selectedUser.events_created.length > 0
                                ? selectedUser.events_created.join(', ')
                                : 'Unknown Event'}
                        </p>

                        <button
                            onClick={handleBackToResults}
                            className="back-button averia-text"
                        >
                            Back to Results
                        </button>

                        <button
                            className="friend-button"
                            onClick={() => {
                                if (
                                    selectedUser &&
                                    selectedUser.username &&
                                    selectedUser.name
                                ) {
                                    window.location.href = `/node/user/${selectedUser.username}`;
                                } else {
                                    alert("This user's profile is missing required fields.");
                                }
                            }}
                        >
                            View Profile
                        </button>

                        <button
                            className="add-event-button"
                            onClick={async () => {
                                const firstEvent = selectedUser?.raw_event_ids?.[0]; 
                                if (!firstEvent) return alert("No event found to add.");

                                try {
                                    const response = await fetch('/node/addMatchedEvent', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({ eventId: firstEvent })
                                    });

                                    const result = await response.json();
                                    if (response.ok) {
                                        alert("Event added to your matched list!");
                                    } else {
                                        alert("Failed to add event: " + result.error);
                                    }
                                } catch (err) {
                                    console.error("Error adding matched event:", err);
                                    alert("Server error");
                                }
                            }}
                        >
                            Add Event
                        </button>

                    </div>
                ) : (
                    <div className="search-results">
                        {results.map((user, index) => (
                            <div key={index} className="search-item">
                                <h3>{user.name}</h3>
                                <p>
                                    <strong>Skills:</strong>{" "}
                                    {Array.isArray(user.skills)
                                        ? user.skills.join(', ')
                                        : user.skill || 'N/A'}
                                </p>
                                <p>
                                    <strong>Description:</strong>{" "}
                                    {user.description || user.bio || 'No description available.'}
                                </p>
                                <p>
                                    <strong>Events:</strong>{" "}
                                    {Array.isArray(user.events_created) && user.events_created.length > 0
                                        ? user.events_created.join(', ')
                                        : 'Unknown Event'}
                                </p>

                                <button
                                    onClick={() => handleViewDetails(user)}
                                    className="view-details-button averia-text"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="waveClass">
                <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path
                        fill="#7B8CDE"
                        fillOpacity="1"
                        d="M0,224 C288,320 576,128 864,224 C1152,320 1440,128 1440,128 L1440,320 L0,320 Z"
                    ></path>
                </svg>
            </div>
        </>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.Fragment>
            <NavBar active="Search" />
            <SearchPage />
        </React.Fragment>
    );
}