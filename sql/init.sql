CREATE TABLE IF NOT EXISTS project (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    DEFAULT "-NA-",
    location        TEXT    DEFAULT "-NA-",
    info            TEXT    DEFAULT "-NA-",
    xmp             INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS user (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER REFERENCES project(id) ON DELETE CASCADE,
    name            TEXT,
    full_name       TEXT,
    password        TEXT,
    is_admin        INTEGER
);
CREATE TABLE IF NOT EXISTS partition (
    id          INTEGER     PRIMARY KEY AUTOINCREMENT,
    name        TEXT        DEFAULT "-NA-",
    location    TEXT        DEFAULT "/",
    active      INTEGER     DEFAULT 1,
    created_on  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    created_by  INTEGER     REFERENCES user(id),
    updated_on  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_by  INTEGER     REFERENCES user(id)
);
CREATE TABLE IF NOT EXISTS camera (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER REFERENCES project(id) ON DELETE CASCADE,
    name            TEXT        DEFAULT "-NA-",
    desc_name       TEXT        DEFAULT "-NA-",
    latitude        TEXT        DEFAULT "-NA-",
    longitude       TEXT        DEFAULT "-NA-",
    altitude        TEXT        DEFAULT "-NA-",
    orientation     TEXT        DEFAULT "-NA-",
    info            TEXT        DEFAULT "-NA-",
    created_on      DATETIME    DEFAULT CURRENT_TIMESTAMP,
    created_by      INTEGER     REFERENCES user(id),
    updated_on      DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_by      INTEGER     REFERENCES user(id)
);
CREATE TABLE IF NOT EXISTS folder (
    id              INTEGER     PRIMARY KEY AUTOINCREMENT,
    camera_id       INTEGER     REFERENCES camera(id) ON DELETE CASCADE,
    partition_id    INTEGER     REFERENCES partition(id) ON DELETE CASCADE,
    name            TEXT        DEFAULT "",
    created_on      DATETIME    DEFAULT CURRENT_TIMESTAMP,
    created_by      INTEGER     REFERENCES user(id),
    updated_on      DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_by      INTEGER     REFERENCES user(id),
    images_all      INTEGER     DEFAULT 0
);
CREATE TABLE IF NOT EXISTS photo (
    id          INTEGER     PRIMARY KEY AUTOINCREMENT,
    folder_id   INTEGER     REFERENCES folder(id) ON DELETE CASCADE,
    name        TEXT        DEFAULT "",
    created_on  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    created_by  INTEGER     REFERENCES user(id),
    updated_on  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_by  INTEGER     REFERENCES user(id)
);
CREATE TABLE IF NOT EXISTS reports (
    id          INTEGER     PRIMARY KEY AUTOINCREMENT,
    name        TEXT        DEFAULT "-NA-",
    query       TEXT        DEFAULT "SELECT * FROM project LIMIT 1",
    read_only   INTEGER     DEFAULT 0,
    created_on  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    created_by  INTEGER     REFERENCES user(id),
    updated_on  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_by  INTEGER     REFERENCES user(id)
);
INSERT INTO reports(name, query)
    SELECT "File Count" AS name, "SELECT COUNT(DISTINCT photo.id) AS Files, COUNT(DISTINCT tag.photo_id) AS Files_Tagged FROM photo LEFT JOIN tag on tag.photo_id = photo.id" AS query
UNION SELECT  "File Count by Camera" AS name, "SELECT c.name AS Camera_Name, COUNT(DISTINCT photo.id) AS Files, COUNT(distinct tag.photo_id) AS Files_Tagged FROM camera c LEFT JOIN folder f ON f.camera_id = c.id LEFT JOIN photo ON photo.folder_id = f.id LEFT JOIN tag on tag.photo_id = photo.id GROUP BY c.id" AS query
UNION SELECT "Tag Count" AS name, "SELECT tag.group_name AS Tag_Group, tag.name AS Tag_Name, COUNT(tag.name) AS Files_Tagged FROM tag GROUP BY tag.name" AS query
;
CREATE TABLE IF NOT EXISTS tag (
    id          INTEGER     PRIMARY KEY AUTOINCREMENT,
    photo_id    INTEGER     REFERENCES photo(id) ON DELETE CASCADE,
    group_name  TEXT        DEFAULT "NA",
    name        TEXT        DEFAULT "NA",
    value       TEXT        DEFAULT "NA",
    created_on  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    created_by  INTEGER     REFERENCES user(id),
    updated_on  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_by  INTEGER     REFERENCES user(id)
);
CREATE TABLE IF NOT EXISTS tag_definition (
    group_name  TEXT        DEFAULT "NA",
    name        TEXT        DEFAULT "NA",
    value_type  TEXT        DEFAULT "NA",
    shortcut    TEXT        DEFAULT "",
    xmp_name    TEXT        DEFAULT "",
    created_on  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    created_by  INTEGER     REFERENCES user(id),
    updated_on  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_by  INTEGER     REFERENCES user(id)
);
CREATE TABLE IF NOT EXISTS xmp (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT,
    display_name    TEXT,
    created_on      DATETIME    DEFAULT CURRENT_TIMESTAMP,
    created_by      INTEGER     REFERENCES user(id),
    updated_on      DATETIME    DEFAULT CURRENT_TIMESTAMP,
    updated_by      INTEGER     REFERENCES user(id)
);
CREATE VIEW
    IF NOT EXISTS
        data_basic AS
            SELECT
                        p.id AS photo_id,
                        part.location AS fs_location,
                        c.name AS camera_name,
                        f.name AS folder_name,
                        p.name AS photo_name,
                        p.created_on AS photo_time,
                        group_concat('"' || t.group_name || '_' || t.name || '": "' || t.value || '"') AS tags
                    FROM camera c
                    LEFT JOIN folder f ON c.id = f.camera_id
                    LEFT JOIN partition part ON part.id = f.partition_id
                    LEFT JOIN photo p ON p.folder_id = f.id
                    LEFT JOIN tag t ON t.photo_id = p.id
                    GROUP BY t.photo_id
                    HAVING t.photo_id IS NOT NULL;
CREATE VIEW
    IF NOT EXISTS
        folder_tagged AS
            SELECT
                f.id AS folder_id,
                COUNT(DISTINCT t.photo_id) AS images_done
                FROM
                    folder f
                    LEFT JOIN photo p ON p.folder_id = f.id
                    LEFT JOIN tag t ON t.photo_id = p.id
                WHERE t.photo_id IS NOT NULL
                GROUP BY f.id;

CREATE TABLE tag_group(name TEXT);

CREATE TABLE tag_value_type(name TEXT);
INSERT INTO tag_value_type VALUES ("Checkbox"), ("Text");

CREATE TABLE IF NOT EXISTS journal (
    id          INTEGER     PRIMARY KEY AUTOINCREMENT, 
    page_size   INTEGER     DEFAULT 100, 
    page        INTEGER     DEFAULT 0, 
    page_index  INTEGER     DEFAULT 0, 
    tag         TEXT        DEFAULT "", 
    camera_id   INTEGER     DEFAULT 0, 
    folder_id   INTEGER     DEFAULT 0, 
    search_query TEXT       DEFAULT "", 
    created_on  DATETIME    DEFAULT CURRENT_TIMESTAMP, 
    created_by  INTEGER     REFERENCES user(id), 
    updated_on  DATETIME    DEFAULT CURRENT_TIMESTAMP, 
    updated_by  INTEGER     REFERENCES user(id)
);

CREATE UNIQUE INDEX camera_name_idx ON camera(name);
CREATE UNIQUE INDEX grp_name_name_idx ON tag_definition(group_name, name);
CREATE UNIQUE INDEX grp_name_shortcut_idx ON tag_definition(group_name, shortcut);
CREATE UNIQUE INDEX tag_photo_idx ON tag(photo_id,group_name,name);
CREATE INDEX photo_tag_idx ON tag(photo_id,name);
