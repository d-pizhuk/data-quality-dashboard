import React, {useState, useRef, useEffect, useCallback} from 'react';
import './styles/DropdownBtn.css'; // Import the CSS file

const DropdownBtn = ({ data }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(Object.keys(data).length === 0 ? null : Object.keys(data)[0]);
    const [selectedDesc, setSelectedDesc] = useState(selectedId !== null ? data[selectedId]["desc"] : "empty data");

    const dropdownRef = useRef(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (key) => {
        setSelectedId(key);
        setSelectedDesc(data[key]["desc"]);
        setIsOpen(false);
        if (dropdownRef.current?.parentElement) {
            dropdownRef.current.parentElement.scrollTop = 0;
        }
    };

    const handleOutsideClick = useCallback((event) => {
        if (isOpen && !dropdownRef.current?.firstChild.contains(event.target)) {
            setIsOpen(false);
        }

    }, [isOpen]);

    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [handleOutsideClick]);

    useEffect(() => {
        const parentEl = dropdownRef.current?.parentElement;

        const handleScroll = () => {
            if (dropdownRef.current) {
                const currentScroll = parentEl.scrollTop;
                dropdownRef.current.firstChild.style.top = currentScroll + "px"
            }
        };

        parentEl.addEventListener('scroll', handleScroll);
        return () => {
            parentEl.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <div className="dropdown-header" onClick={handleToggle}>
                {selectedId ? data[selectedId]["name"] : "Select an option"}
                <span className={`arrow ${isOpen ? 'up' : 'down'}`}></span>
            </div>
            {isOpen && (
                <div className="dropdown-menu">
                    {Object.keys(data).map((key) => (
                        <div
                            className="dropdown-item"
                            key={key}
                            onClick={() => handleSelect(key)}
                        >
                            {data[key]["name"]}
                        </div>
                    ))}
                </div>
            )}
            <p dangerouslySetInnerHTML={{ __html: selectedDesc }}></p>
        </div>
    );
}

export default DropdownBtn;
