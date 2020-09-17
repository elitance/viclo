create database wiki;

use wiki;

create table docs(
    id int(11) not null auto_increment,
    title text not null,
    content longtext not null,
    author varchar(50) not null,
    keywords text not null,
    primary key (id)
);

create table account(
    id int(11) not null auto_increment,
    un varchar(50) not null,
    pw varchar(50) not null,
    primary key (id)
);