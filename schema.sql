-- Create and Use Database
CREATE DATABASE IF NOT EXISTS alumniconnect;
USE alumniconnect;

-- Table 1: Users (The Parent Table)
CREATE TABLE IF NOT EXISTS Users (
    User_ID INT PRIMARY KEY AUTO_INCREMENT,
    Full_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password_Hash VARCHAR(255) NOT NULL,
    User_Type ENUM('Student', 'Alumni') NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Companies (Normalization - 3NF)
CREATE TABLE IF NOT EXISTS Companies (
    Company_ID INT PRIMARY KEY AUTO_INCREMENT,
    Company_Name VARCHAR(100) UNIQUE NOT NULL,
    Location VARCHAR(100)
);

-- Table 3: Alumni_Profiles (1:1 Relationship)
CREATE TABLE IF NOT EXISTS Alumni_Profiles (
    Profile_ID INT PRIMARY KEY AUTO_INCREMENT,
    User_ID INT,
    Company_ID INT,
    Job_Title VARCHAR(100),
    Years_Experience INT CHECK (Years_Experience >= 0),
    Graduation_Year INT,
    CONSTRAINT chk_grad_year CHECK (Graduation_Year <= 2100),
    FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Company_ID) REFERENCES Companies(Company_ID) ON DELETE SET NULL
);

-- Table 4: Skills (Lookup Table)
CREATE TABLE IF NOT EXISTS Skills (
    Skill_ID INT PRIMARY KEY AUTO_INCREMENT,
    Skill_Name VARCHAR(50) UNIQUE NOT NULL
);

-- Table 5: Alumni_Skills (M:N Relationship)
CREATE TABLE IF NOT EXISTS Alumni_Skills (
    Alumni_User_ID INT,
    Skill_ID INT,
    PRIMARY KEY (Alumni_User_ID, Skill_ID),
    FOREIGN KEY (Alumni_User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Skill_ID) REFERENCES Skills(Skill_ID) ON DELETE CASCADE
);

-- Table 6: Mentorship_Sessions (Transaction Focus)
CREATE TABLE IF NOT EXISTS Mentorship_Sessions (
    Session_ID INT PRIMARY KEY AUTO_INCREMENT,
    Alumni_ID INT NOT NULL,
    Student_ID INT DEFAULT NULL, -- NULL means "Available", Filled means "Booked"
    Topic VARCHAR(255) DEFAULT 'General Mentorship',
    Session_Time DATETIME NOT NULL,
    Meeting_Link VARCHAR(255),
    Status ENUM('Available', 'Booked', 'Completed') DEFAULT 'Available',
    FOREIGN KEY (Alumni_ID) REFERENCES Users(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Student_ID) REFERENCES Users(User_ID) ON DELETE SET NULL
);

-- Table 7: Connection_Requests 
CREATE TABLE IF NOT EXISTS Connection_Requests (
    Request_ID INT PRIMARY KEY AUTO_INCREMENT,
    Student_ID INT NOT NULL,
    Alumni_ID INT NOT NULL,
    Status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    FOREIGN KEY (Student_ID) REFERENCES Users(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Alumni_ID) REFERENCES Users(User_ID) ON DELETE CASCADE,
    UNIQUE(Student_ID, Alumni_ID)
);

-- Table 8: Notifications 
CREATE TABLE IF NOT EXISTS Notifications (
    Notif_ID INT PRIMARY KEY AUTO_INCREMENT,
    User_ID INT NOT NULL,
    Message VARCHAR(255) NOT NULL,
    Is_Read BOOLEAN DEFAULT FALSE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);

-- Table 9: Job_Opportunities
CREATE TABLE IF NOT EXISTS Job_Opportunities (
    Job_ID INT PRIMARY KEY AUTO_INCREMENT,
    Alumni_ID INT NOT NULL,
    Company_ID INT NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Description TEXT,
    Skills_Required VARCHAR(255),
    Posted_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Alumni_ID) REFERENCES Users(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Company_ID) REFERENCES Companies(Company_ID) ON DELETE CASCADE
);

-- Table 10: Messages (Private Chat)
CREATE TABLE IF NOT EXISTS Messages (
    Message_ID INT PRIMARY KEY AUTO_INCREMENT,
    Sender_ID INT NOT NULL,
    Receiver_ID INT NOT NULL,
    Content TEXT NOT NULL,
    Sent_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Sender_ID) REFERENCES Users(User_ID) ON DELETE CASCADE,
    FOREIGN KEY (Receiver_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);

-- Triggers

DELIMITER $$

-- Trigger logic: When Alumni changes connection status to 'Accepted', send notification
CREATE TRIGGER On_Request_Accept
AFTER UPDATE ON Connection_Requests
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Accepted' AND OLD.Status = 'Pending' THEN
        INSERT INTO Notifications (User_ID, Message)
        VALUES (NEW.Student_ID, CONCAT('Your connection request was accepted!'));
    END IF;
END$$

DELIMITER ;

-- Insert some dummy skills and companies
INSERT IGNORE INTO Skills (Skill_Name) VALUES 
('Python'), ('Java'), ('JavaScript'), ('React'), ('Node.js'), ('SQL'), ('Machine Learning'), ('System Design');

INSERT IGNORE INTO Companies (Company_Name, Location) VALUES
('Google', 'Bangalore'), ('Microsoft', 'Hyderabad'), ('Amazon', 'Bangalore'), ('Atlassian', 'Sydney');
