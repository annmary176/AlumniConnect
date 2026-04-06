USE alumniconnect;

DROP TABLE IF EXISTS Session_Bookings;
DROP TABLE IF EXISTS Mentorship_Sessions;

-- Redesigned Mentorship_Sessions to support Max_Students (M:N mapping)
CREATE TABLE Mentorship_Sessions (
    Session_ID INT PRIMARY KEY AUTO_INCREMENT,
    Alumni_ID INT NOT NULL,
    Topic VARCHAR(255) DEFAULT 'General Mentorship',
    Session_Time DATETIME NOT NULL,
    Meeting_Link VARCHAR(255),
    Max_Students INT DEFAULT 1,
    FOREIGN KEY (Alumni_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);

-- Junction table for Student Bookings
CREATE TABLE Session_Bookings (
    Booking_ID INT PRIMARY KEY AUTO_INCREMENT,
    Session_ID INT NOT NULL,
    Student_ID INT NOT NULL,
    Booked_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Session_ID) REFERENCES Mentorship_Sessions(Session_ID) ON DELETE CASCADE,
    FOREIGN KEY (Student_ID) REFERENCES Users(User_ID) ON DELETE CASCADE,
    UNIQUE(Session_ID, Student_ID)
);

DELIMITER $$
DROP TRIGGER IF EXISTS Check_Session_Capacity$$

-- The Trigger requested by the user: Throws an explicit error message if session Limit is reached!
CREATE TRIGGER Check_Session_Capacity
BEFORE INSERT ON Session_Bookings
FOR EACH ROW
BEGIN
    DECLARE current_count INT;
    DECLARE max_count INT;

    SELECT COUNT(*) INTO current_count FROM Session_Bookings WHERE Session_ID = NEW.Session_ID;
    SELECT Max_Students INTO max_count FROM Mentorship_Sessions WHERE Session_ID = NEW.Session_ID;

    IF current_count >= max_count THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Session Limit Reached! Cannot book this session.';
    END IF;
END$$
DELIMITER ;
