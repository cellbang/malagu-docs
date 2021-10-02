---
title: 创建模型
description: 本篇通过使用Malagu框架编写Blog来演示相关组件用法
type: learn
lang: zh-CN
---

# 创建模型

我们使用typeorm的entity定义字段，配置好后启动项目typeorm自动生成数据库表

### 配置数据库

我们先创建一个数据库，名称为`malagu-blog`，在项目根目录下创建`malagu-local.yml`加入以下内容：

```yml
backend: 
  malagu:
    typeorm:
      ormConfig:
        - type: mysql
          host: '127.0.0.1'
          port: 3306
          synchronize: true
          username: test
          password: '123456'
          database: malagu-blog
          logging: true
```

* synchronize开发的时候要打开，typeorm会根据entity来创建、修改表和索引。typeorm某些功能是通过修改数据库定义实现的

### 创建模型

分类模型`src/backend/entity/category.ts`内容如下：

```ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, OneToMany, JoinColumn } from "typeorm";
import { Post } from "./post";

@Entity({ name: "categories" })
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "parent_id" })
    parentId: number;

    @Column()
    title: string;

    @Column()
    level: number;

    @Column()
    desc: string;

    @OneToMany(() => Post, (post) => post.category, { eager: true })
    @JoinColumn({ referencedColumnName: "category_id" })
    posts: Post[];

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;
}
```

* 字段名和表中定义不一样的，可以用@Column选项来指定表中的字段名，@CreateDateColumn、@UpdateDateColumn会修改数据库字段的默认值，所以需要开启`synchronize`选项

blog模型`src/backend/entity/post.ts`内容如下：

```ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
    UpdateDateColumn, JoinColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Category } from "./category";
import { Tag } from "./tag";

@Entity({ name: "posts" })
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Category)
    @JoinColumn({ name: "category_id" })
    category: Category;

    @ManyToMany(() => Tag, (tag) => tag.posts)
    @JoinTable({
        name: "post_tags",
        joinColumn: {
            name: "post_id"
        },
        inverseJoinColumn: {
            name: "tag_id"
        }
    })
    tags: Tag[];

    @Column()
    title: string;

    @Column({
        length: 10000
    })
    content: string;

    @Column()
    desc: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: number;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: number;
}
```

* typeorm中OneToOne和ManyToOne有不同的表中结构约束，不可混用。ManyToMany使用自定义的表名和表字段，需要手动指定

tag模型`src/backend/entity/tag.ts`内容如下：

```ts
import { BaseEntity, Entity, Column, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm";
import { Post } from "./post";

@Entity({ name: "tags" })
export class Tag extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(() => Post, (post) => post.tags)
    posts: Post[];

    @Column()
    title: string;

    @Column()
    desc: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: number;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: number;
}
```

将定义好的模型导出

创建`src/backend/entity/index.ts`内容如下：

```ts
export * from "./category";
export * from "./post";
export * from "./tag";
```

修改`src/backend/module.ts`加入以下内容：

```ts
import { autoBindEntities } from '@malagu/typeorm';
import * as entities from './entity';

autoBindEntities(entities);
```


