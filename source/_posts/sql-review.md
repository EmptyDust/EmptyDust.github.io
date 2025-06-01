---
title: sql_review
date: 2025-05-30 10:20:59
tags:
---
```sql
insert into tn (a, b, c) values (A, B, C);
delete from tn where ..;
update tn set A=b where ..;
alter tn add column cn not null default 0;

create table tn (
    A decimal(10, 2) not null default 9,
    B vartext,
    C text,
    primary key (A, B),
    foreign key (A) references Teacher(A),
    foreign key (B) references Class(B)
);

delimiter //
create trigger trin 
before insert on tn
for each row
begin
    declare D decimal(10,4);

    if xxx then
        signal sqlstate '45000'
        set message_text = '';
    elseif xxx then

    end if

end



create view vn as
select * from tn;

delimiter //
create procedure p1 (in ii decimal(10, 4))
begin
select 
Year(curdate()) - Year(birthday) as age
from 
tn
group by A
having sum(salary) > 1000
end


```

