use remy;

drop table if exists shopping_list_items;
drop table if exists shopping_lists;
drop table if exists steps;
drop table if exists ingredients;
drop table if exists messages;
drop table if exists recipes;
drop table if exists chats;

create table chats (
    id int auto_increment primary key,
    title varchar(255) not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

create table messages (
    id int auto_increment primary key,
    chat_id int not null,
    role enum('user', 'assistant') not null,
    content text not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    constraint fk_messages_chat_id
        foreign key (chat_id) references chats(id)
        on delete cascade
);

create table recipes (
    id int auto_increment primary key,
    source_chat_id int null,
    name varchar(255) not null,
    description text not null,
    image_url varchar(255),
    url varchar(255),
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    constraint fk_recipes_source_chat_id
        foreign key (source_chat_id) references chats(id)
        on delete set null
);

create table ingredients (
    id int auto_increment primary key,
    recipe_id int not null,
    name varchar(255) not null,
    ingredient_number int not null,
    quantity decimal(10,3) null,
    unit varchar(32) null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    constraint fk_ingredients_recipe_id
        foreign key (recipe_id) references recipes(id)
        on delete cascade
);

create table steps (
    id int auto_increment primary key,
    recipe_id int not null,
    step_number int not null,
    description text not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    constraint fk_steps_recipe_id
        foreign key (recipe_id) references recipes(id)
        on delete cascade
);

create table shopping_lists (
    id int auto_increment primary key,
    recipe_id int not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    constraint fk_shopping_lists_recipe_id
        foreign key (recipe_id) references recipes(id)
        on delete cascade
);

create table shopping_list_items (
    id int auto_increment primary key,
    shopping_list_id int not null,
    ingredient_id int null,
    name_snapshot varchar(255) not null,
    quantity decimal(10,3) null,
    unit varchar(32) null,
    is_checked tinyint(1) not null default 0,
    external_item_id varchar(128) null,
    external_source varchar(64) null,
    match_confidence decimal(5,4) null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    constraint fk_sli_list_id
        foreign key (shopping_list_id) references shopping_lists(id)
        on delete cascade,
    constraint fk_sli_ingredient_id
        foreign key (ingredient_id) references ingredients(id)
        on delete set null
);