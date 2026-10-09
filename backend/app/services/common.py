from math import ceil


def paginate(query, page: int, page_size: int):
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    total_pages = ceil(total / page_size) if total else 1
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


PRIORITY_ORDER = {
    "high": 3,
    "medium": 2,
    "low": 1,
}
