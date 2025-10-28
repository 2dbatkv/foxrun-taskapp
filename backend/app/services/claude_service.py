from anthropic import Anthropic
from app.config import get_settings
from typing import Optional

settings = get_settings()


def get_client():
    """Get Anthropic client instance"""
    return Anthropic(api_key=settings.anthropic_api_key)


async def chat_with_claude(message: str, context: Optional[str] = None) -> str:
    """
    Send a message to Claude and get a response

    Args:
        message: The user's message
        context: Optional context to provide to Claude

    Returns:
        Claude's response as a string
    """
    system_message = "You are a helpful assistant integrated into a task planning and productivity application. Help users manage their tasks, calendar, reminders, and knowledge base effectively."

    if context:
        system_message += f"\n\nContext: {context}"

    try:
        client = get_client()
        response = client.messages.create(
            model="claude-sonnet-4-20250514",  # Updated model name
            max_tokens=1024,
            system=system_message,
            messages=[
                {"role": "user", "content": message}
            ]
        )

        return response.content[0].text
    except Exception as e:
        raise Exception(f"Error communicating with Claude: {str(e)}")


async def search_with_claude(query: str, data_context: str) -> str:
    """
    Use Claude to intelligently search through user data

    Args:
        query: The search query
        data_context: The data to search through

    Returns:
        Claude's analysis and search results
    """
    system_message = "You are a search assistant. Analyze the provided data and return relevant results based on the user's query. Be concise and highlight the most relevant information."

    try:
        client = get_client()
        response = client.messages.create(
            model="claude-sonnet-4-20250514",  # Updated model name
            max_tokens=2048,
            system=system_message,
            messages=[
                {
                    "role": "user",
                    "content": f"Query: {query}\n\nData to search:\n{data_context}"
                }
            ]
        )

        return response.content[0].text
    except Exception as e:
        raise Exception(f"Error performing search with Claude: {str(e)}")
